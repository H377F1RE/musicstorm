<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = [
        'release_id',
        'format',
        'position',
        'title',
        'track_count',
    ];

    public function release()
    {
        return $this->belongsTo(Release::class);
    }

    public function tracks()
    {
        return $this->hasMany(Track::class);
    }
}