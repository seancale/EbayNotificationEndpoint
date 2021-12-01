import * as mssql from "mssql";

export interface DBSettings {
	server: string,
	user: string,
	password: string,
	database: string,
	options?: {
		trustServerCertificate?: boolean
	}
}
export interface DBParam {
	name: string,
	value: any,
	type: mssql.ISqlType
}

export class DBDriver {
	private conn: mssql.ConnectionPool;
	public settings: DBSettings;

	constructor(settings: DBSettings) {
		this.settings = settings;
		this.conn = new mssql.ConnectionPool(this.settings);
		console.log("Database driver initialized.");

		this.conn.on("error", (err: string) => {
			console.error(err);
		});
	}

	//Runs query on the database.
	//queryString = string
	query(queryString: string) {
		return new Promise((res, rej) => {
			this.conn.connect().catch((e) => rej(e)).then(() => {
				let req = new mssql.Request(this.conn);
				req.query(queryString).then((result) => res(result)).catch((err) => rej(err));
			});
		});
	}

	//Inserts data into DB.
	insert(table: string, params: Array<DBParam>) {
		return new Promise((res, rej) => {
			this.conn.connect().catch((e) => rej(e)).then(() => {
				let req = new mssql.Request(this.conn), columns: Array<string> = [];
				
				//adding parameters into the query
				for (let p of params) {
					columns.push(p.name);
					req.input(p.name, p.type, p.value);
				}

				req.query(`INSERT INTO ${table} (${columns.join(",")}) VALUES (@${columns.join(",@")})`)
				.catch((err) => rej(err))
				.then((result) => res(result));
			});
		});
	}
}
