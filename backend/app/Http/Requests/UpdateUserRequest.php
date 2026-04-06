<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
    
        $userId = $this->route('id');
        $user = $this->user();
        return $user && (
            $user->role === 'admin' || 
            $user->id == $userId
        );
    }

    public function rules(): array
    {
        $userId = $this->route('id');
        
        return [
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users')->ignore($userId)
            ],
            'password' => 'sometimes|string|min:8|confirmed',
            'role' => 'sometimes|in:student,teacher,admin',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Dit email adres is al in gebruik',
            'password.min' => 'Wachtwoord moet minimaal 8 tekens bevatten',
            'password.confirmed' => 'Wachtwoorden komen niet overeen',
            'role.in' => 'Ongeldige rol',
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