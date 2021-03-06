//= require angular
//= require angular-resource
//= require angular-ui-router

"use strict";

(function(){
  angular
  .module("snackApp", [
    "ui.router",
    "ngResource"
    // "snacks"
  ])
  .config([
    "$stateProvider",
    RouteFunction
  ])
  .factory("SnackFactory", [
    "$resource",
    SnackFactoryFunction
  ])
  .factory("CommentFactory", [
    "$resource",
    CommentFactoryFunction
  ])
  .controller("IndexController", [
    "SnackFactory",
    IndexControllerFunction
  ])
  .controller("NewController", [
    "SnackFactory",
    "$state",
    NewControllerFunction
  ])
  .controller("ShowController", [
    "SnackFactory",
    "CommentFactory",
    "$stateParams",
    ShowControllerFunction
  ])
  .directive("snackForm", [
    "SnackFactory",
    "$state",
    SnackFormDirectiveFunction
  ]);

  function RouteFunction($stateProvider){
    $stateProvider
    .state("index", {
      url: "/",
      templateUrl: "ng-views/snack.index.html",
      controller: 'IndexController',
      controllerAs:'SnackIndexVM'
    })
    .state("new", {
      url:'/new',
      templateUrl: "ng-views/snack.new.html",
      controller: 'NewController',
      controllerAs: 'SnackNewVM'

    })
    .state("show", {
      url: "/:id",
      templateUrl: "ng-views/snack.show.html",
      controller: "ShowController",
      controllerAs: "SnackShowVM"
    });
  }

  // SnackFactoryFunction
  function SnackFactoryFunction($resource){
    var Snack = $resource("/snacks/:id.json", {}, {
      update: {method: "PUT"}
    });
    Snack.all = Snack.query();
    return Snack;
  }

  //CommentFactoryFunction
  function CommentFactoryFunction($resource){
    return $resource("/snacks/:snack_id/comments/:id", {snack_id:"@snack_id"}, {
      update: {method: "PUT"}
    });
  }

  //IndexControllerFunction
  function IndexControllerFunction(Snack) {
    var vm = this;

    // lists all snacks and properties
    vm.snacks = Snack.all;
    vm.countriesFound = [];

    // lists all unique countries
    vm.countries = Snack.query(function(response){
      response.forEach(function(snack){
        for(var prop in snack){
          if(prop == 'country'){
            var countryCheck = vm.countriesFound.indexOf(snack[prop]);
            if(countryCheck == -1){
              vm.countriesFound.push(snack[prop]);
            }
          }
        }
      });
    });
    vm.countrySearch = function(criteria){
      vm.countryCategory = criteria
    };

    console.log(vm.countriesFound);

  }

  function NewControllerFunction(SnackFactory, $state){
    var vm = this;
    vm.snack = new SnackFactory();
    // vm.snacks = SnackFactory.all;
    // vm.create = function(){
    //   console.log('saving');
    //   vm.snack.$save(function(snack){
    //     $state.go('show', snack);
    //   vm.snacks.push(vm.snack);
    //
    //   });
    // }
  }


  function ShowControllerFunction(SnackFactory, CommentFactory, $stateParams){
    var vm = this;
    vm.snack = SnackFactory.get({id: $stateParams.id});

    //things cam was working on eariler
    // vm.formDisplay = false;
    // vm.toggleForm = function(){
    //   vm.formDisplay = vm.formDisplay === false ? true:  false;
    // }

    // comments logic
    vm.comments = CommentFactory.query({snack_id: $stateParams.id});
    vm.comment = new CommentFactory({snack_id: $stateParams.id});

    this.create = function(){
      vm.comment.$save(function(response){
        vm.comments.push(response);
      });
      vm.comment = {};
    };
  }

  function SnackFormDirectiveFunction(SnackFactory, $state){
    return{
      templateUrl: "ng-views/snack.form.html",
      scope: {
        snack: "="
      },
      link: function(scope){
        scope.create = function(){
          scope.snack.$save(function(response){
            SnackFactory.all.push(response);
            $state.go("show", {id: response.id}, {reload: true});
          });
        }
        scope.update = function(){
          scope.snack.$update({id: scope.snack.id}, function(response){
            console.log(response);
          });
        }
        scope.delete = function(){
          scope.snack.$delete({id: scope.snack.id}, function(){
            SnackFactory.all = SnackFactory.query();
            $state.go("index", {}, {reload: true});
          });
        }
      }
    }
  }
})();
