<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'login'    => 'required|string|max:255|exists:users,login',
            'password' => 'required|string|min:6',
        ];
    }
    
    public function messages()
    {
        return [
            'login.required'    => 'Поле логин обязательно.',
            'login.exists'      => 'Пользователь с таким логином не найден.',
            'password.required' => 'Пароль обязателен.',
            'password.min'      => 'Пароль должен содержать не менее 6 символов.',
        ];
    }
}
