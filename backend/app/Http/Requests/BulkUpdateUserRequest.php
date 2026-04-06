<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class BulkUpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Alleen admins kunnen bulk updates doen
        return Auth::check() && Auth::user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'users' => 'required|array|min:1',
            'users.*.id' => 'required|exists:users,id',
            'users.*.role' => 'sometimes|in:student,teacher,admin',
            'users.*.name' => 'sometimes|string|max:255',
            'users.*.email' => 'sometimes|email|unique:users,email,' . $this->users['*.id'],
        ];
    }

    public function messages(): array
    {
        return [
            'users.required' => 'Users array is verplicht',
            'users.*.id.required' => 'User ID is verplicht',
            'users.*.id.exists' => 'User bestaat niet',
            'users.*.role.in' => 'Ongeldige rol',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validatiefout',
            'errors' => $validator->errors()
        ], 422));
    }
}