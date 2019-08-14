import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { ControlsValidatorDirective } from '../../shared/utils/controls-validator';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { SdkService } from '../sdk.service';

@Component({
	selector: 'app-descriptor-generator',
	templateUrl: './descriptor-generator.component.html',
	styleUrls: ['./descriptor-generator.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class DescriptorGeneratorComponent implements OnInit {

	serviceForm: FormGroup;
	disabledButton = true;
	isEmpty = true;
	section = 'sdk';

	constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private sdkService: SdkService) { }

	ngOnInit() {
		this.initForm();
	}

	initForm() {
		this.serviceForm = new FormGroup({
			name: new FormControl('', [Validators.required]),
			author: new FormControl(''),
			vendor: new FormControl(''),
			description: new FormControl(''),
			numberOfVNFs: new FormControl('', [Validators.required])
		});
		this.serviceForm.valueChanges.subscribe(() => this.onFormChanges());
	}

	private onFormChanges() {
		this.disabledButton = !this.serviceForm.valid;
		this.isEmpty = !this.serviceForm.dirty;
	}

	createService() {
		// TODO: move this to a new environment in the environments folder and use angular configuration instead
		// const baseip = 'http://localhost';
		const baseip = 'http://192.168.99.100';
		const endpoint = baseip + ':5098/api/v1/projects';

		// get info from form
		const name = this.serviceForm.get('name').value;
		const author = this.serviceForm.get('author').value;
		const vendor = this.serviceForm.get('vendor').value;
		const description = this.serviceForm.get('description').value;
		const numVnfs = this.serviceForm.get('numberOfVNFs').value;

		const body = new HttpParams()
			.set('name', name)
			.set('author', author)
			.set('vendor', vendor)
			.set('description', description)
			.set('vnfs', numVnfs);

		this.http.post(endpoint,
			body.toString(),
			{
				headers: new HttpHeaders()
					.set('Content-Type', 'application/x-www-form-urlencoded')
					.set('Access-Control-Allow-Origin', baseip + ':5098')
			}
		).subscribe(response => {
			this.sdkService.newProject(name, author, vendor, description, numVnfs, response['uuid'], response['files']);
			this.router.navigate(['sdk/descriptor-displayer']);
		});
	}

	close() {
		this.router.navigate(['../'], { relativeTo: this.route });
	}
}
