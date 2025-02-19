import { Injectable } from '@angular/core';
import { ConfigService } from '../shared/services/config/config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TemplateBindingParseResult } from '@angular/compiler';

@Injectable()
export class AuthService {
	authHeaders: HttpHeaders;

	constructor(private config: ConfigService, private http: HttpClient) {
		this.setAuthHeaders();
	}

	async login(username: string, password: string) {
		const url = this.config.baseSP + this.config.login;

		const data = {
			username: username,
			password: password
		};

		if (localStorage.getItem('token')) {
			await this.logout();
		}

		this.setAuthHeaders();

		try {
			const login = await this.http.post(url, data, { headers: this.authHeaders }).toPromise();
			localStorage.setItem('token', login[ 'token' ]);
			localStorage.setItem('username', username);
			this.setAuthHeaders();
			return login;
		} catch (error) {
			console.error(error);
			return error.error.error;
		}
	}

	async logout() {
		this.removeLocalStorage();
		const url = this.config.baseSP + this.config.login;

		try {
			return await this.http.delete(url, { headers: this.authHeaders }).toPromise();
		} catch (error) {
			console.error(error);
		}
	}

	private removeLocalStorage() {
		localStorage.removeItem('token');
		localStorage.removeItem('username');
	}

	async signup(user: object) {
		const url = this.config.baseSP + this.config.register;

		try {
			return await this.http.post(url, user, { headers: this.authHeaders }).toPromise();
		} catch (error) {
			console.error(error);
			return error.error.error;
		}
	}

	private setAuthHeaders() {
		localStorage.getItem('token') ?
			this.authHeaders = new HttpHeaders()
				.set('Authorization', 'Bearer ' + localStorage.getItem('token'))
			: this.authHeaders = new HttpHeaders();
	}

	async getUserRoles() {
		const url = this.config.baseSP + this.config.roles;

		try {
			const roles = await this.http.get(url, { headers: this.authHeaders }).toPromise();
			return roles && roles[ 'roles' ] ?
				Object.keys(roles[ 'roles' ]).filter(role => role.toLowerCase() !== 'admin') :
				[ '-' ];
		} catch (error) {
			console.error(error);
			return [ '-' ];
		}
	}

	getAuthHeadersContentTypeJSON() {
		return this.authHeaders.set('Content-Type', 'application/json');
	}

	getAuthHeadersContentTypeURLEncoded() {
		return this.authHeaders.set('Content-Type', 'application/x-www-form-urlencoded');
	}

	getAuthHeaders() {
		return this.authHeaders;
	}

	isAuthenticated(): boolean {
		return localStorage.getItem('token') ? true : false;
	}
}
