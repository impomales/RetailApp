exports.categoryProducts = function() {
    return {
        controller: 'CategoryProductsController',
        templateUrl: '/templates/category_products.html'
    };
};

exports.categoryTree = function() {
    return {
        controller: 'CategoryTreeController',
        templateUrl: '/templates/category_tree.html'
    };
};

exports.userMenu = function() {
    return {
        controller: 'UserMenuController',
        templateUrl: '/templates/user_menu.html'
    };
};

exports.productDetails = function() {
    return {
        controller: 'ProductDetailsController',
        templateUrl: '/templates/product_details.html'
    };
};