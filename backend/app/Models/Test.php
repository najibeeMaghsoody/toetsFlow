<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'description', 'teacher_id', 'is_public', 'max_attempts'
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function sections()
    {
        return $this->hasMany(Section::class)->orderBy('order');
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_test')
                    ->withPivot('start_date', 'end_date')
                    ->withTimestamps();
    }

    public function testAttempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function isAvailableForUser(User $user)
    {
        if ($this->is_public) {
            return true;
        }

        $now = now();
        
        return $this->groups()
            ->whereHas('users', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('start_date', '<=', $now)
            ->where('end_date', '>=', $now)
            ->exists();
    }
}