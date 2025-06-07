<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Release extends Model
{
    protected $fillable = [
        'release_group_id',
        'label_id',
        'title',
        'cover',
        'release_date',
        'country',
        'catalog_number',
        'barcode',
    ];

    public function releaseGroup()
    {
        return $this->belongsTo(ReleaseGroup::class);
    }

    public function label()
    {
        return $this->belongsTo(Label::class);
    }

    public function media()
    {
        return $this->hasMany(Media::class);
    }
}