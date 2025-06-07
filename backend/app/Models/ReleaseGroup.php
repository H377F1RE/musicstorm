<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReleaseGroup extends Model
{
    protected $fillable = [
        'artist_id',
        'name',
        'type',
        'first_release_date',
    ];

    public function artist()
    {
        return $this->belongsTo(Artist::class);
    }

    public function releases()
    {
        return $this->hasMany(Release::class);
    }
}
