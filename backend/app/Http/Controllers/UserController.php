<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Auth\ChangeThemeRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserList;
use App\Models\UserListItem;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class UserController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('search', ''));
        $query = User::query();
        if ($q !== '') {
            $query->where('login', 'like', "%{$q}%");
        }
        $users = $query->get();
        return $this->success($users);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);
        if (! $user) {
            return $this->error('Пользователь не найден', 404);
        }
        $payload = [
            'id'    => $user->id,
            'login' => $user->login,
        ];
        return $this->success($payload);
    }

    public function checkLogin(Request $request): JsonResponse
    {
        $login = $request->query('login');
        if ($request->user()) {
            $userId = $request->user()->id;
            $exists = User::where('login', $login)
                          ->where('id', '<>', $userId)
                          ->exists();
        } else {
            $exists = User::where('login', $login)->exists();
        }

        return response()->json(['available' => !$exists]);
    }

    public function checkEmail(Request $request): JsonResponse
    {
        $email = $request->query('email');

        if ($request->user()) {
            $userId = $request->user()->id;
            $exists = User::where('email', $email)
                          ->where('id', '<>', $userId)
                          ->exists();
        } else {
            $exists = User::where('email', $email)->exists();
        }

        return response()->json(['available' => !$exists]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
    
        $request->validate([
            'login' => 'sometimes|required|string|max:255|unique:users,login,' . $user->id,
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
        ]);
    
        if ($request->has('login')) {
            $user->login = $request->input('login');
        }
        if ($request->has('email')) {
            $user->email = $request->input('email');
        }
        $user->save();
    
        return $this->success($user, 'Данные профиля обновлены');
    }


    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json(['error' => 'Текущий пароль неверен'], 422);
        }

        $user->password = Hash::make($request->input('new_password'));
        $user->save();

        return $this->success(null, 'Пароль успешно изменён');
    }

    public function publicLists(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);
        if (! $user) {
            return $this->error('Пользователь не найден', 404);
        }
        $lists = UserList::where('user_id', $id)
            ->where('public', true)
            ->get(['id', 'name', 'created_at']);
        return $this->success($lists);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        return $this->success($user);
    }

    public function changeTheme(ChangeThemeRequest $request)
    {
        $user = $request->user();
        $user->theme = $request->input('theme');
        $user->save();
        return $this->success($user, 'Theme updated');
    }

    public function collection(Request $request): JsonResponse
    {
        $user = $request->user();
        $userList = $user->userLists()
            ->where('type', 'collection')
            ->first();

        if (! $userList) {
            return $this->error('Системный список “collection” не найден', 500);
        }

        $items = $userList->items()
            ->with(['release.releaseGroup.artist', 'release.label'])
            ->get();

        $releases = $items->map(fn($item) => $item->release);
        return $this->success($releases);
    }

    public function addToCollection(Request $request): JsonResponse
    {
        $request->validate([
            'release_id' => 'required|integer|exists:releases,id',
        ]);

        $user = $request->user();
        $releaseId = $request->input('release_id');

        $userList = $user->userLists()
            ->where('type', 'collection')
            ->first();
        if (! $userList) {
            return $this->error('Системный список “collection” не найден', 500);
        }

        $exists = $userList->items()
            ->where('release_id', $releaseId)
            ->exists();

        if ($exists) {
            return $this->error('Релиз уже в коллекции', 409);
        }

        UserListItem::create([
            'user_list_id' => $userList->id,
            'release_id'   => $releaseId,
        ]);

        return $this->success(null, 'Релиз добавлен в коллекцию');
    }

    public function removeFromCollection(Request $request, int $release): JsonResponse
    {
        $user = $request->user();
        $releaseId = $release;

        $userList = $user->userLists()
            ->where('name', 'collection')
            ->first();

        if (! $userList) {
            return $this->error('Системный список “collection” не найден', 500);
        }

        $item = $userList->items()
            ->where('release_id', $releaseId)
            ->first();

        if (! $item) {
            return $this->error('Релиз в коллекции не найден', 404);
        }

        $item->delete();
        return $this->success(null, 'Релиз удалён из коллекции');
    }

    public function wishlist(Request $request): JsonResponse
    {
        $user = $request->user();

        $userList = $user->userLists()
            ->where('type', 'wishlist')
            ->first();

        if (! $userList) {
            return $this->error('Системный список “wishlist” не найден', 500);
        }

        $items = $userList->items()
            ->with(['release.releaseGroup.artist', 'release.label'])
            ->get();

        $releases = $items->map(fn($item) => $item->release);
        return $this->success($releases);
    }

    public function addToWishlist(Request $request): JsonResponse
    {
        $request->validate([
            'release_id' => 'required|integer|exists:releases,id',
        ]);

        $user = $request->user();
        $releaseId = $request->input('release_id');

        $userList = $user->userLists()
            ->where('type', 'wishlist')
            ->first();

        if (! $userList) {
            return $this->error('Системный список “wishlist” не найден', 500);
        }

        $exists = $userList->items()
            ->where('release_id', $releaseId)
            ->exists();

        if ($exists) {
            return $this->error('Релиз уже в желаемом', 409);
        }

        UserListItem::create([
            'user_list_id' => $userList->id,
            'release_id'   => $releaseId,
        ]);

        return $this->success(null, 'Релиз добавлен в желаемое');
    }

    public function removeFromWishlist(Request $request, int $release): JsonResponse
    {
        $user = $request->user();
        $releaseId = $release;

        $userList = $user->userLists()
            ->where('type', 'wishlist')
            ->first();

        if (! $userList) {
            return $this->error('Системный список “wishlist” не найден', 500);
        }

        $item = $userList->items()
            ->where('release_id', $releaseId)
            ->first();

        if (! $item) {
            return $this->error('Релиз не найден в желаемом', 404);
        }

        $item->delete();
        return $this->success(null, 'Релиз удалён из желаемого');
    }

    public function lists(Request $request): JsonResponse
    {
        $user = $request->user();
        $lists = $user->userLists()
            ->where('type', 'user')
            ->withCount('items')
            ->get();

        return $this->success($lists);
    }

    public function listItems(Request $request, int $list): JsonResponse
    {
        $userList = UserList::with([
                'items.release.releaseGroup.artist',
                'items.release.label',
                'user'
            ])
            ->find($list);
            if (! $userList) {
                return $this->error('Список не найден', 404);
            }
            if (! $userList->public) {
                $currentUser = null;
            try {
                if ($token = JWTAuth::getToken()) {
                    $currentUser = JWTAuth::parseToken()->authenticate();
                }
            } catch (JWTException $e) {
                $currentUser = null;
            }

            if (! $currentUser || $currentUser->id !== $userList->user_id) {
                return $this->error('Доступ запрещён', 403);
            }
        }

        $owner = $userList->user;
        $ownerData = [
            'id'    => $owner->id,
            'login' => $owner->login,
        ];

        $releases = $userList->items->map(fn($item) => $item->release);

        $payload = [
            'list_name' => $userList->name,
            'owner'     => $ownerData,
            'public'    => (bool) $userList->public,
            'releases'  => $releases,
        ];

        return $this->success($payload);
    }

    public function createList(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user = $request->user();

        $newList = UserList::create([
            'user_id'   => $user->id,
            'type'      => 'user',
            'name'      => $request->input('name'),
            'public' => false,
        ]);

        return $this->success($newList, 'Пользовательский список создан');
    }

    public function deleteList(Request $request, int $list): JsonResponse
    {
        $user = $request->user();

        $userList = UserList::where('user_id', $user->id)
            ->where('type', 'user')
            ->where('id', $list)
            ->first();

        if (! $userList) {
            return $this->error('Список не найден или не ваш', 404);
        }

        $userList->delete();

        return $this->success(null, 'Список удалён');
    }

    public function updateList(Request $request, int $list): JsonResponse
    {
        $request->validate([
            'public' => 'required|boolean',
        ]);

        $user = $request->user();
        $userList = UserList::where('user_id', $user->id)
            ->where('type', 'user')
            ->where('id', $list)
            ->first();

        if (! $userList) {
            return $this->error('Список не найден или не пренадлежит вам', 404);
        }
        $userList->update([
            'public' => $request->input('public'),
        ]);
        return $this->success($userList, 'Видимость списка обновлена');
    }

    public function addListItem(Request $request, int $list): JsonResponse
    {
        $request->validate([
            'release_id' => 'required|integer|exists:releases,id',
        ]);

        $user = $request->user();
        $userList = UserList::where('user_id', $user->id)
            ->where('type', 'user')
            ->where('id', $list)
            ->first();

        if (! $userList) {
            return $this->error('Список не найден или не ваш', 404);
        }
        $already = UserListItem::where('user_list_id', $userList->id)
            ->where('release_id', $request->input('release_id'))
            ->exists();

        if ($already) {
            return $this->error('Этот релиз уже есть в списке', 409);
        }
        $item = UserListItem::create([
            'user_list_id' => $userList->id,
            'release_id'   => $request->input('release_id'),
        ]);

        return $this->success($item, 'Релиз добавлен в список');
    }

    public function deleteListItem(Request $request, int $list, int $item): JsonResponse
    {
        $user = $request->user();

        $userList = UserList::where('user_id', $user->id)
            ->where('type', 'user')
            ->where('id', $list)
            ->first();

        if (! $userList) {
            return $this->error('Список не найден или не ваш', 404);
        }

        $listItem = UserListItem::where('user_list_id', $userList->id)
            ->where('release_id', $item)
            ->first();

        if (! $listItem) {
            return $this->error('Элемент не найден в указанном списке', 404);
        }

        $listItem->delete();

        return $this->success(null, 'Элемент удалён из списка');
    }
}