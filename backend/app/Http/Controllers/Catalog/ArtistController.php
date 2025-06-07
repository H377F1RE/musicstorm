<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\ApiController;
use App\Models\Artist;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ArtistController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $q = $request->query('search', '');
        $query = Artist::query();
        if ($q !== '') {
            $query->where('name', 'ilike', "%{$q}%");
        }
        $artists = $query->get();
        return $this->success($artists);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $data = $request->validate([
            'name'            => 'required|string|max:128',
            'country'         => 'nullable|string|size:2',
            'type'            => 'required|in:solo,group,orchestra',
            'created_at_real' => 'nullable|date',
            'ended_at'        => 'nullable|date|after_or_equal:created_at_real',
        ]);

        $artist = Artist::create($data);
        return $this->success($artist, 'Artist created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $artist = Artist::with(['releaseGroups.releases'])->findOrFail($id);
        return $this->success($artist);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $artist = Artist::findOrFail($id);
        $data = $request->validate([
            'name'            => 'required|string|max:128',
            'country'         => 'nullable|string|size:2',
            'type'            => 'required|in:solo,group,orchestra',
            'created_at_real' => 'nullable|date',
            'ended_at'        => 'nullable|date|after_or_equal:created_at_real',
        ]);

        $artist->update($data);
        return $this->success($artist, 'Artist updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $artist = Artist::findOrFail($id);
        $artist->delete();
        return $this->success(null, 'Artist deleted');
    }
}