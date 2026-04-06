<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'teacher_id'];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_group');
    }

    public function tests()
    {
        return $this->belongsToMany(Test::class, 'group_test')
                    ->withPivot('start_date', 'end_date')
                    ->withTimestamps();
    }
}