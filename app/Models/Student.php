<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'nim',
        'name',
        'email',
        'phone',
        'address',
        'major',
        'faculty',
        'gpa',
        'semester',
        'status',
    ];

    protected $casts = [
        'gpa' => 'decimal:2',
        'semester' => 'integer',
    ];
}
