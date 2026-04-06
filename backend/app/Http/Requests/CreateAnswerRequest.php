<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class CreateAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Alleen docenten kunnen antwoorden toevoegen
        return Auth::check() && Auth::user()->role === 'teacher';
    }

    public function rules(): array
    {
        return [
            'answer_text' => 'required|string|max:1000',
            'is_correct' => 'sometimes|boolean',
            'order' => 'sometimes|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'answer_text.required' => 'Antwoord tekst is verplicht',
            'answer_text.max' => 'Antwoord mag maximaal 1000 tekens zijn',
            'is_correct.boolean' => 'is_correct moet waar of onwaar zijn',
            'order.integer' => 'Volgorde moet een getal zijn',
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