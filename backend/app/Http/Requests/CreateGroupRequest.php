<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class CreateGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Alleen docenten kunnen groepen aanmaken
        return Auth::check() && Auth::user()->role === 'teacher';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:groups,name',
            'description' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Groepsnaam is verplicht',
            'name.max' => 'Groepsnaam mag maximaal 255 tekens zijn',
            'name.unique' => 'Deze groepsnaam bestaat al',
            'description.max' => 'Beschrijving mag maximaal 1000 tekens zijn',
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