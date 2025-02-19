import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ValidationAndVerificationPlatformService } from '../validation-and-verification.service';
import { UtilsService } from '../../shared/services/common/utils.service';
import { DialogDataService } from '../../shared/services/dialog/dialog.service';

@Component({
	selector: 'app-tests-detail',
	templateUrl: './tests-detail.component.html',
	styleUrls: [ './tests-detail.component.scss' ],
	encapsulation: ViewEncapsulation.None
})
export class TestsDetailComponent implements OnInit {
	loading: boolean;
	detail = { };
	testPlans = new Array();
	relatedServices = new Array();
	displayedColumns = [ 'vendor', 'name', 'version' ];
	displayedColumnsTestPlans = [ 'serviceName', 'updatedAt', 'status' ];

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private utilsService: UtilsService,
		private verificationAndValidationPlatformService: ValidationAndVerificationPlatformService,
		private dialogData: DialogDataService
	) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			this.requestTest(params[ 'id' ]);
		});
	}

	/**
     * Generates the HTTP request of a Slices instance by UUID.
     *
     * @param uuid ID of the selected instance to be displayed.
     *             Comming from the route.
     */
	async requestTest(uuid) {
		this.loading = true;
		const response = await this.verificationAndValidationPlatformService.getOneTest(uuid);

		if (response) {
			this.detail = response;
		} else {
			this.utilsService.openSnackBar('Unable to fetch the test', '');
			this.close();
		}

		const relatedServices = await this.verificationAndValidationPlatformService.getTestRelatedServices(this.detail[ 'uuid' ]);
		if (relatedServices) {
			this.relatedServices = relatedServices;
		} else {
			this.utilsService.openSnackBar('There are no network services related to this test available', '');
		}

		const testPlans = await this.verificationAndValidationPlatformService.getTestPlans(`?testUuid=${ this.detail[ 'uuid' ] }`);
		this.loading = false;
		if (testPlans) {
			this.testPlans = testPlans;
		} else {
			this.utilsService.openSnackBar('There are no test executions available', '');
		}
	}

	execute() {
		const title = this.detail[ 'name' ];
		const content = 'Do you want to automatically execute the test? \
						Otherwise, the tests planned will require your manual \
						confirmation to be run. ';
		const action = 'Yes';
		const secondaryAction = 'No';

		this.dialogData.openDialog(title, content, action,
			() => this.createTestPlans(this.detail[ 'uuid' ], false),
			() => this.createTestPlans(this.detail[ 'uuid' ], true), secondaryAction);
	}

	async createTestPlans(uuid, confirmRequired) {
		this.loading = true;
		const response = await this.verificationAndValidationPlatformService.postTestPlans('tests', uuid, confirmRequired);

		this.loading = false;
		response ?
			this.router.navigate([ 'validation-and-verification/test-plans' ])
			: this.utilsService.openSnackBar('Unable to execute this test', '');
	}

	copyToClipboard(value) {
		this.utilsService.copyToClipboard(value);
	}

	close() {
		this.router.navigate([ '../' ], { relativeTo: this.route });
	}
}
