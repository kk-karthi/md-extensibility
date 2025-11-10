sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: my.sample.app",
		defaults: {
			page: "ui5://test-resources/my/sample/app/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "my/sample/app/",
				never: "test-resources/my/sample/app/"
			},
			loader: {
				paths: {
					"my/sample/app": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for my.sample.app"
			},
			"integration/opaTests": {
				title: "Integration tests for my.sample.app"
			}
		}
	};
});
