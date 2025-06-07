<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;

class ApiController extends BaseController
{
    protected function success($data = null, string $message = '', int $code = 200)
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    protected function error(string $message = '', int $code = 400, $errors = null)
    {
        $payload = [
            'status'  => 'error',
            'message' => $message,
        ];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        return response()->json($payload, $code);
    }
}