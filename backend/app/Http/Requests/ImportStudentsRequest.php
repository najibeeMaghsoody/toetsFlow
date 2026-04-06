<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class ImportStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Alleen admins kunnen studenten importeren
        $user = Auth::user();
        return $user && $user->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:csv,txt|max:10240',
            'delimiter' => 'sometimes|in:,,;,|',
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'CSV bestand is verplicht',
            'file.file' => 'Upload een geldig bestand',
            'file.mimes' => 'Bestand moet CSV of TXT formaat zijn',
            'file.max' => 'Bestand mag maximaal 10MB zijn',
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