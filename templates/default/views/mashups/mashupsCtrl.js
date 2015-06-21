define([
	'js/qlik',
	'app',
	'jquery',
	'utils'
], function (qlik, app, $) {

	app.controller('views/MashupsCtrl', function ($scope, $modal, $location, dataService, cssInjector) {
		
		cssInjector.removeAll();
		cssInjector.add("css/metro/bootstrap.min.css");
		
		$scope.store = dataService.getStore();

		$scope.addMashup = function() {
			
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'views/mashups/mashups.modal.new.html',
				controller: 'views/MashupsModalNewCtrl',
				size: 'lg'
			});
			
			modalInstance.result.then(function (selectedItem) {
				dataService.setStore();
			});
		}
		
		$scope.menuOptions = [
			['Open', function ($itemScope) {
				$location.path( '/' + $itemScope.mashup.title + '/1' );
			}],
			null,
			['Delete', function ($itemScope) {
				delete $scope.store.mashups[$itemScope.mashup.title];
				dataService.setStore();
			}]
		];
	});
	
	app.controller('views/MashupsModalNewCtrl', function ($scope, $modalInstance, dataService) {
		
		$scope.store = dataService.getStore();
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

			$scope.store.mashups[$scope.mashup.title] = $scope.mashup;
			
			$modalInstance.close(true);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		
	});
	
		
		
});