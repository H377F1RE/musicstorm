<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeThemeRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'theme' => [
                'required',
                Rule::in(['light','dark']),
            ],
        ];
    }

    public function messages()
    {
        return [
            'theme.required' => 'Не указана тема.',
            'theme.in'       => 'Тема должна быть либо "light", либо "dark".',
        ];
    }
}
