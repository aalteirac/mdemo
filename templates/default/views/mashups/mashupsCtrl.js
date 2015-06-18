define([
	'js/qlik',
	'app',
	'jquery',
	'utils'
], function (qlik, app, $) {

	app.controller('views/MashupsCtrl', function ($scope, $modal, dataService, cssInjector) {
		
		cssInjector.removeAll();
		cssInjector.add("css/slate/bootstrap.min.css");
		
		$scope.store = dataService.getStore();
		
		
		$scope.addMashup = function() {
			
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'views/mashups/mashups.modal.new.html',
				controller: 'views/MashupsModalNewCtrl',
				size: 'lg',
				resolve: {
					mashups: function () {
						return $scope.store.mashups;
					}
				}
			});

			modalInstance.result.then(function (result) {

			});
			
		}
		
	});
	
	app.controller('views/MashupsModalNewCtrl', function ($scope, $modalInstance, mashups, dataService) {
		
		$scope.cache = dataService.getCache();
		
		var navBar = {
			brand: 'Qlik',
			left: [
				{ id: 1, type: 'link', title: 'Default', page: '1', items: [] }
			],
			theme: 'default'
		}
		
		$scope.mashup = {
			name: 'New mashup!',
			title: 'newMashup',
			color: 'default',
			theme: 'default',
			navbar: navBar,
			pages: {
				'1': {
					navbar: navBar,
					header: {
						show: true,
						title: 'Default',
						description: 'Welcome to the default mashup!'
					},
					rows: [
						[

						]
					]
				}
			}
		};
		
		$scope.firstOpen = true;

		$scope.ok = function () {

			mashups[$scope.mashup.title] = $scope.mashup;
			
			$modalInstance.close(true);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		
	});
	
		
		
});