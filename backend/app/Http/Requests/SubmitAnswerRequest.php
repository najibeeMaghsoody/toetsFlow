<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class SubmitAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Alleen studenten kunnen antwoorden indienen
        return Auth::check() && Auth::user()->role === 'student';
    }

    public function rules(): array
    {
        return [
            'question_id' => 'required|exists:questions,id',
            'answer_id' => 'required_without:text_answer|exists:answers,id',
            'text_answer' => 'required_without:answer_id|string|max:5000',
        ];
    }

    public function messages(): array
    {
        return [
            'question_id.required' => 'Vraag ID is verplicht',
            'question_id.exists' => 'Vraag bestaat niet',
            'answer_id.exists' => 'Antwoord bestaat niet',
            'text_answer.max' => 'Tekstantwoord mag maximaal 5000 tekens zijn',
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