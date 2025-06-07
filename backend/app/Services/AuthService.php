<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthService
{
    protected $users;

    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    public function register(array $data): User
    {
        $data['password'] = Hash::make($data['password']);

        $user = $this->users->create([
            'login'    => $data['login'],
            'email'    => $data['email'],
            'password' => $data['password'],
            'role'     => 'user',
            'blocked'  => false,
            'theme'    => $data['theme'] ?? 'light',
        ]);

        return $user;
    }

    public function login(array $credentials): ?string
    {
        try {
            if (! $token = JWTAuth::attempt([
                'login'    => $credentials['login'],
                'password' => $credentials['password']
            ])) {
                return null;
            }
        } catch (JWTException $e) {
            return null;
        }

        return $token;
    }

    public function logout(): void
    {
        JWTAuth::invalidate(JWTAuth::getToken());
    }

    public function user()
    {
        return auth('api')->user();
    }

    public function changeTheme(User $user, string $theme): bool
    {
        return $user->update(['theme' => $theme]);
    }
}
