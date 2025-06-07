<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'    => $this->id,
            'login' => $this->login,
            'email' => $this->email,
            'role'  => $this->role,
            'theme' => $this->theme,
        ];
    }
}
