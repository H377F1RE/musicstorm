<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\ApiController;
use App\Models\Track;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TrackController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $q = $request->query('search', '');
        $query = Track::with('media');
        if ($q !== '') {
            $query->where('title', 'like', "%{$q}%");
        }
        $tracks = $query->get();
        return $this->success($tracks);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $data = $request->validate([
            'media_id'  => 'required|integer|exists:media,id',
            'position'  => 'nullable|integer',
            'isrc'      => 'nullable|string|max:12',
            'title'     => 'required|string|max:128',
            'alt_title' => 'nullable|string|max:128',
            'duration'  => 'nullable|integer',
        ]);

        $track = Track::create($data);
        return $this->success($track, 'Track created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $track = Track::with('media')->findOrFail($id);
        return $this->success($track);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $track = Track::findOrFail($id);
        $data = $request->validate([
            'media_id'  => 'required|integer|exists:media,id',
            'position'  => 'nullable|integer',
            'isrc'      => 'nullable|string|max:12',
            'title'     => 'required|string|max:128',
            'alt_title' => 'nullable|string|max:128',
            'duration'  => 'nullable|integer',
        ]);

        $track->update($data);
        return $this->success($track, 'Track updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $track = Track::findOrFail($id);
        $track->delete();
        return $this->success(null, 'Track deleted');
    }
}
