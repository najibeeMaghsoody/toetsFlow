<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|ends_with:@school.nl',
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Naam is verplicht',
            'email.required' => 'Email is verplicht',
            'email.email' => 'Voer een geldig email adres in',
            'email.unique' => 'Dit email adres is al geregistreerd',
            'email.ends_with' => 'Gebruik je schoolmail (@school.nl)',
            'password.required' => 'Wachtwoord is verplicht',
            'password.min' => 'Wachtwoord moet minimaal 8 tekens bevatten',
            'password.confirmed' => 'Wachtwoorden komen niet overeen',
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