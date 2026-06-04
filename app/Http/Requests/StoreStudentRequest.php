<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $studentId = $this->route('student');

        return [
            'nim' => 'required|string|size:12|regex:/^\d{12}$/|unique:students,nim,'.$studentId,
            'name' => 'required|string|max:100|regex:/^[\pL\s\.\'-]+$/u',
            'email' => 'required|email|max:100|unique:students,email,'.$studentId,
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^(\+62|0)[0-9]{8,15}$/'],
            'address' => 'nullable|string|max:500',
            'major' => 'required|string|max:100',
            'faculty' => 'required|string|max:100',
            'gpa' => 'required|numeric|min:0|max:4.00',
            'semester' => 'required|integer|min:1|max:14',
            'status' => 'required|in:active,graduated,dropped_out',
        ];
    }

    public function messages(): array
    {
        return [
            'nim.regex' => 'Format NIM harus 12 digit angka (contoh: 241011450628)',
            'nim.size' => 'NIM harus 12 digit angka',
            'name.regex' => 'Nama hanya boleh mengandung huruf, spasi, titik, tanda petik, dan strip',
            'phone.regex' => 'Format nomor telepon tidak valid (contoh: 081234567890 atau +6281234567890)',
        ];
    }
}
