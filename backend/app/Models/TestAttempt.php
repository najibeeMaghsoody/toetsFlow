<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'test_id', 'started_at', 'completed_at', 'score', 'attempts_count'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function userAnswers()
    {
        return $this->hasMany(UserAnswer::class);
    }

    public function calculateScore()
    {
        $totalQuestions = $this->userAnswers()->count();
        $correctAnswers = $this->userAnswers()->where('is_correct', true)->count();
        
        return $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 10 : 0;
    }
}