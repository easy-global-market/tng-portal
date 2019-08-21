import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SdkService } from '../sdk.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
	selector: 'app-packager',
	templateUrl: './packager.component.html',
	styleUrls: ['./packager.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PackagerComponent implements OnInit {
	projectUuid: string;

	constructor(private sdkService: SdkService, private http: HttpClient) { }

	ngOnInit() {
		this.projectUuid = this.sdkService.project.uuid;
	}

	// start packaging
	package(): void {
		// TODO: move this to a new environment in the environments folder and use angular configuration instead
		// const baseip = 'http://localhost';
		const baseip = 'http://192.168.99.100';
		const endpoint = baseip + ':5098/api/v1/projects/' + this.projectUuid + '/package';
		const header = new HttpHeaders()
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.set('Access-Control-Allow-Origin', baseip + ':5098');

		// TODO: skip validation if selected
		const body = new HttpParams().set('skip_validation', 'true');

		this.http.post(endpoint, body.toString(), { headers: header }).subscribe(response => {
			console.log(response);
		});
	}
}
