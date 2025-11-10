sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast", "sap/m/MessageBox"], function (BaseController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("my.sample.app.controller.Main", {
		onInit: function () {
			// Initialize view model for UI state
			const oViewModel = new JSONModel({
				editEnabled: false,
				deleteEnabled: false
			});
			this.getView().setModel(oViewModel, "viewModel");

			// Wait for the main model to be available
			this.getView().attachModelContextChange(this._onModelLoaded.bind(this));

		},

		_onModelLoaded: function () {
			const oModel = this.getView().getModel();
			if (oModel && !this._dataLoaded) {
				this._dataLoaded = true;
				this._loadCompanyCodes();
			}
		},

		_loadCompanyCodes: function () {
			const oModel = this.getView().getModel();
			if (!oModel) {
				console.warn("Model not available for loading company codes");
				return;
			}
			try {
				const oBinding = oModel.bindList("/CompanyCodes");

				oBinding.requestContexts().then((aContexts) => {
					console.log("Loaded " + aContexts.length + " company codes");
					MessageToast.show("Loaded " + aContexts.length + " company codes");
				}).catch((oError) => {
					console.error("Error loading company codes:", oError);
					MessageBox.error("Error loading data: " + oError.message);
				});
			} catch (error) {
				console.error("Error creating binding:", error);
				MessageBox.error("Failed to create data binding: " + error.message);
			}
		},

		onSelectionChange: function (oEvent) {
			const bSelected = oEvent.getParameter("selected");
			const oViewModel = this.getView().getModel("viewModel");

			oViewModel.setData({
				editEnabled: bSelected,
				deleteEnabled: bSelected
			});
		},

		onCreatePress: function () {
			this._openDialog();
		},

		onEditPress: function () {
			const oTable = this.byId("companyCodeTable");
			const oSelectedItem = oTable.getSelectedItem();

			if (oSelectedItem) {
				const oContext = oSelectedItem.getBindingContext();
				this._openDialog(oContext);
			}
		},

		onDeletePress: function () {
			const oTable = this.byId("companyCodeTable");
			const oSelectedItem = oTable.getSelectedItem();

			if (oSelectedItem) {
				const oContext = oSelectedItem.getBindingContext();
				const sCode = oContext.getProperty("code");

				MessageBox.confirm(`Delete Company Code ${sCode}?`, {
					onClose: (oAction) => {
						if (oAction === MessageBox.Action.OK) {
							this._deleteCompanyCode(oContext);
						}
					}
				});
			}
		},

		_openDialog: function (oContext) {
			if (!this._oDialog) {
				this._createDialog();
			}

			if (oContext) {
				// Edit mode
				this._oDialog.setTitle("Edit Company Code");
				this._isEditMode = true;
				this._currentContext = oContext;
				// Load data for edit
				oContext.requestObject().then((oData) => {
					this._setDialogValues(oData);
					this._oDialog.open();
				}).catch((error) => {
					MessageBox.error("Error loading data: " + error.message);
				});
			} else {
				// Create mode
				this._oDialog.setTitle("Create Company Code");
				this._isEditMode = false;
				this._currentContext = null;

				// Unbind dialog to prevent context confusion
				this._oDialog.unbindElement();
				this._clearDialogInputs();
				this._oDialog.open();
			}
		},

		_createDialog: function () {
			this._oDialog = sap.ui.xmlfragment("my.sample.app.view.MainCodeDialog", this);
			this.getView().addDependent(this._oDialog);
		},


		_clearDialogInputs: function () {
			// Clear all input fields in dialog
			sap.ui.getCore().byId("codeInput").setValue("");
			sap.ui.getCore().byId("nameInput").setValue("");
			sap.ui.getCore().byId("countryInput").setValue("");
			sap.ui.getCore().byId("currencyInput").setValue("");
			sap.ui.getCore().byId("languageInput").setValue("");
		},
		_setDialogValues: function (oData) {
			// Set values manually for edit mode
			sap.ui.getCore().byId("codeInput").setValue(oData.code || "");
			sap.ui.getCore().byId("nameInput").setValue(oData.name || "");
			sap.ui.getCore().byId("countryInput").setValue(oData.country || "");
			sap.ui.getCore().byId("currencyInput").setValue(oData.currency || "");
			sap.ui.getCore().byId("languageInput").setValue(oData.language || "");
		},

		onDialogSave: function () {
			if (this._isEditMode) {
				this._updateCompanyCode();
			} else {
				this._createCompanyCode();
			}
		},

		_createCompanyCode: function () {
			const oModel = this.getView().getModel();
			const oData = this._getDialogData();

			console.log("Model service URL:", oModel.getServiceUrl());
			console.log("Creating with data:", oData);

			const oListBinding = oModel.bindList("/CompanyCodes");
			const oContext = oListBinding.create(oData);

			oContext.created().then(() => {
				MessageToast.show("Company Code created successfully");
				this._oDialog.close();
			}).catch((oError) => {
				MessageBox.error("Error creating Company Code: " + oError.message);
			});
		},

		_updateCompanyCode: function () {
			// Use this._currentContext instead of this._oDialog.getBindingContext()
			const oContext = this._currentContext;
			const oData = this._getDialogData();

			// Check if context exists
			if (!oContext) {
				MessageBox.error("No context available for update");
				return;
			}

			console.log("Updating context:", oContext.getPath());
			console.log("Update data:", oData);

			try {
				// Set properties on the context
				Object.keys(oData).forEach(key => {
					if (oData[key] !== undefined && oData[key] !== null) {
						oContext.setProperty(key, oData[key]);
					}
				});

				// Submit the changes
				oContext.getModel().submitBatch("updateGroup").then(() => {
					MessageToast.show("Company Code updated successfully");
					this._oDialog.close();
					// Clear the current context
					this._currentContext = null;
					this._isEditMode = false;
				}).catch((oError) => {
					console.error("Update error:", oError);
					MessageBox.error("Error updating Company Code: " + oError.message);
				});
			} catch (error) {
				console.error("Error setting properties:", error);
				MessageBox.error("Error updating properties: " + error.message);
			}
		},

		_deleteCompanyCode: function (oContext) {
			oContext.delete().then(() => {
				MessageToast.show("Company Code deleted successfully");
				this._loadCompanyCodes();
			}).catch((oError) => {
				MessageBox.error("Error deleting Company Code: " + oError.message);
			});
		},

		_getDialogData: function () {
			return {
				code: sap.ui.getCore().byId("codeInput").getValue(),
				name: sap.ui.getCore().byId("nameInput").getValue(),
				country: sap.ui.getCore().byId("countryInput").getValue(),
				currency: sap.ui.getCore().byId("currencyInput").getValue(),
				language: sap.ui.getCore().byId("languageInput").getValue(),
			};
		},

		onDialogCancel: function () {
			this._oDialog.close();
		}
	});
});
