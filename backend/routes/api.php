<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UserController;

use App\Http\Controllers\Catalog\LabelController;
use App\Http\Controllers\Catalog\ArtistController;
use App\Http\Controllers\Catalog\ReleaseGroupController;
use App\Http\Controllers\Catalog\ReleaseController;
use App\Http\Controllers\Catalog\MediaController;
use App\Http\Controllers\Catalog\TrackController;

Route::post ('register',            [AuthController::class, 'register']);
Route::post ('login',               [AuthController::class, 'login']);
Route::get  ('user/check-login',    [UserController::class, 'checkLogin']);
Route::get  ('user/check-email',    [UserController::class, 'checkEmail']);

Route::get('labels',        [LabelController::class, 'index']);
Route::get('labels/{id}',   [LabelController::class, 'show']);

Route::get('artists',       [ArtistController::class, 'index']);
Route::get('artists/{id}',  [ArtistController::class, 'show']);

Route::get('release-groups',        [ReleaseGroupController::class, 'index']);
Route::get('release-groups/{id}',   [ReleaseGroupController::class, 'show']);

Route::get('releases',      [ReleaseController::class, 'index']);
Route::get('releases/{id}', [ReleaseController::class, 'show']);

Route::get('media',         [MediaController::class, 'index']);
Route::get('media/{id}',    [MediaController::class, 'show']);

Route::get('tracks',        [TrackController::class, 'index']);
Route::get('tracks/{id}',   [TrackController::class, 'show']);

Route::get('users',         [UserController::class, 'index']);
Route::get('users/{id}',    [UserController::class, 'show']);
Route::get('users/{id}/lists',  [UserController::class, 'publicLists']);

Route::get('user/lists/{list}', [UserController::class, 'listItems']);

Route::middleware('jwt.auth')->group(function () {
    Route::post     ('logout',              [AuthController::class, 'logout']);
    Route::post     ('refresh',             [AuthController::class, 'refresh']);
    Route::get      ('profile',             [UserController::class, 'profile']);
    Route::post     ('theme',               [UserController::class, 'changeTheme']);
    Route::post     ('labels',              [LabelController::class, 'store']);
    Route::put      ('labels/{id}',         [LabelController::class, 'update']);
    Route::delete   ('labels/{id}',         [LabelController::class, 'destroy']);

    Route::post     ('artists',             [ArtistController::class, 'store']);
    Route::put      ('artists/{id}',        [ArtistController::class, 'update']);
    Route::delete   ('artists/{id}',        [ArtistController::class, 'destroy']);

    Route::post     ('release-groups',      [ReleaseGroupController::class, 'store']);
    Route::put      ('release-groups/{id}', [ReleaseGroupController::class, 'update']);
    Route::delete   ('release-groups/{id}', [ReleaseGroupController::class, 'destroy']);

    Route::post     ('releases',            [ReleaseController::class, 'store']);
    Route::put      ('releases/{id}',       [ReleaseController::class, 'update']);
    Route::delete   ('releases/{id}',       [ReleaseController::class, 'destroy']);

    Route::post     ('media',               [MediaController::class, 'store']);
    Route::put      ('media/{id}',          [MediaController::class, 'update']);
    Route::delete   ('media/{id}',          [MediaController::class, 'destroy']);

    Route::post     ('tracks',              [TrackController::class, 'store']);
    Route::put      ('tracks/{id}',         [TrackController::class, 'update']);
    Route::delete   ('tracks/{id}',         [TrackController::class, 'destroy']);

    Route::get      ('user/collection',     [UserController::class, 'collection']);
    Route::get      ('user/wishlist',       [UserController::class, 'wishlist']);
    Route::get      ('user/lists',          [UserController::class, 'lists']);
    Route::post     ('user/lists',          [UserController::class, 'createList']);
    Route::delete   ('user/lists/{list}',   [UserController::class, 'deleteList']);
    Route::patch    ('user/lists/{list}',   [UserController::class, 'updateList']);
    Route::post     ('user/lists/{list}/items',         [UserController::class, 'addListItem']);
    Route::delete   ('user/lists/{list}/items/{item}',  [UserController::class, 'deleteListItem']);

    Route::patch    ('user',                        [UserController::class, 'updateProfile']);
    Route::patch    ('user/password',               [UserController::class, 'changePassword']);

    Route::post     ('user/collection',             [UserController::class, 'addToCollection']);
    Route::delete   ('user/collection/{release}',   [UserController::class, 'removeFromCollection']);
    Route::post     ('user/wishlist',               [UserController::class, 'addToWishlist']);
    Route::delete   ('user/wishlist/{release}',     [UserController::class, 'removeFromWishlist']);
});
