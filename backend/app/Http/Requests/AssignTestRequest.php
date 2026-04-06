<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Group;

class AssignTestRequest extends FormRequest
{
    public function authorize(): bool
    {
   
        return Auth::check() && Auth::user()->role === 'teacher';
    }

    public function rules(): array
    {
        return [
            'start_date' => 'required|date|after_or_equal:now',
            'end_date' => 'required|date|after:start_date',
            'group_id' => 'sometimes|exists:groups,id',
            'user_id' => 'sometimes|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required' => 'Start datum is verplicht',
            'start_date.after_or_equal' => 'Start datum moet in de toekomst liggen',
            'end_date.required' => 'Eind datum is verplicht',
            'end_date.after' => 'Eind datum moet na de start datum liggen',
            'group_id.exists' => 'De geselecteerde groep bestaat niet',
            'user_id.exists' => 'De geselecteerde gebruiker bestaat niet',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Check of er minstens één target is geselecteerd
            if (!$this->filled('group_id') && !$this->filled('user_id')) {
                $validator->errors()->add(
                    'target',
                    'Selecteer een groep of een student om de toets aan toe te wijzen.'
                );
            }
            
            // Check dat je niet beide invult
            if ($this->filled('group_id') && $this->filled('user_id')) {
                $validator->errors()->add(
                    'target',
                    'Kies een groep OF een individuele student, niet beide.'
                );
            }
            
            // Check dat de user_id daadwerkelijk een student is
            if ($this->filled('user_id')) {
                $user = User::find($this->user_id);
                if ($user && $user->role !== 'student') {
                    $validator->errors()->add(
                        'user_id',
                        'Je kunt alleen toetsen toewijzen aan studenten.'
                    );
                }
            }
            
            // Check dat de groep bestaat en van dezelfde docent is
            if ($this->filled('group_id')) {
                $group = Group::find($this->group_id);
                if ($group && $group->teacher_id !== Auth::user()->id) {
                    $validator->errors()->add(
                        'group_id',
                        'Je kunt alleen toetsen toewijzen aan groepen die je zelf hebt gemaakt.'
                    );
                }
            }
        });
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