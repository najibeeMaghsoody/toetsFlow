<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Alleen admins kunnen gebruikers aanmaken
        $user = Auth::user();
        return $user && $user->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,teacher,admin',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Naam is verplicht',
            'email.required' => 'Email is verplicht',
            'email.email' => 'Voer een geldig email adres in',
            'email.unique' => 'Dit email adres bestaat al',
            'password.required' => 'Wachtwoord is verplicht',
            'password.min' => 'Wachtwoord moet minimaal 8 tekens bevatten',
            'role.required' => 'Rol is verplicht',
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