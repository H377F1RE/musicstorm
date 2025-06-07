<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserListItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_list_id',
        'release_id',
    ];

    public function userList()
    {
        return $this->belongsTo(UserList::class, 'user_list_id');
    }
    
    public function release()
    {
        return $this->belongsTo(Release::class, 'release_id');
    }
}
