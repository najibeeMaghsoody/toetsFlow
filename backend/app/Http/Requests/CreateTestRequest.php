<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class CreateTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Alleen docenten kunnen toetsen aanmaken
        return Auth::check() && Auth::user()->role === 'teacher';
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'is_public' => 'sometimes|boolean',
            'max_attempts' => 'sometimes|integer|min:1|max:10',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Toets titel is verplicht',
            'title.max' => 'Titel mag maximaal 255 tekens zijn',
            'max_attempts.integer' => 'Max pogingen moet een getal zijn',
            'max_attempts.min' => 'Minimaal 1 poging toegestaan',
            'max_attempts.max' => 'Maximaal 10 pogingen toegestaan',
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