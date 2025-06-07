<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'login'                 => 'required|string|max:255|unique:users,login',
            'email'                 => 'required|string|email|max:255|unique:users,email',
            'password'              => 'required|string|min:6|confirmed',
            'password_confirmation' => 'required|string|min:6',
        ];
    }

    public function messages()
    {
        return [
            'login.required'                 => 'Поле логин обязательно.',
            'login.string'                   => 'Логин должен быть строкой.',
            'login.max'                      => 'Логин не должен превышать 255 символов.',
            'login.unique'                   => 'Логин занят.',

            'email.required'                 => 'Поле email обязательно.',
            'email.string'                   => 'Email должен быть строкой.',
            'email.email'                    => 'Неверный формат email.',
            'email.max'                      => 'Email не должен превышать 255 символов.',
            'email.unique'                   => 'Такой email уже зарегистрирован.',

            'password.required'              => 'Поле пароль обязательно.',
            'password.string'                => 'Пароль должен быть строкой.',
            'password.min'                   => 'Пароль должен содержать не менее 6 символов.',
            'password.confirmed'             => 'Пароли не совпадают.',

            'password_confirmation.required' => 'Поле подтверждение пароля обязательно.',
            'password_confirmation.string'   => 'Подтверждение пароля должно быть строкой.',
            'password_confirmation.min'      => 'Подтверждение пароля должно содержать не менее 6 символов.',
        ];
    }
}
