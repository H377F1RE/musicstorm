<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Artist extends Model
{
    protected $fillable = [
        'name',
        'country',
        'type',
        'created_at_real',
        'ended_at',
    ];

    public function releaseGroups()
    {
        return $this->hasMany(ReleaseGroup::class);
    }
}