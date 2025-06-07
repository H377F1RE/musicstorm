<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Track extends Model
{
    protected $fillable = [
        'media_id',
        'position',
        'isrc',
        'title',
        'alt_title',
        'duration',
    ];

    public function media()
    {
        return $this->belongsTo(Media::class);
    }
}