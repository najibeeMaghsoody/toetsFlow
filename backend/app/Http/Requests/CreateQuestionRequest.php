<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class CreateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Alleen docenten kunnen vragen toevoegen
        return Auth::check() && Auth::user()->role === 'teacher';
    }

    public function rules(): array
    {
        return [
            'question_text' => 'required|string|max:5000',
            'type' => 'required|in:single_choice,multiple_choice,text',
            'order' => 'sometimes|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'question_text.required' => 'Vraag tekst is verplicht',
            'question_text.max' => 'Vraag mag maximaal 5000 tekens zijn',
            'type.required' => 'Type vraag is verplicht',
            'type.in' => 'Type moet single_choice, multiple_choice of text zijn',
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