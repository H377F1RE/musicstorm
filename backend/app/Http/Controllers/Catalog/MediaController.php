<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\ApiController;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MediaController extends ApiController
{
    public function index(): JsonResponse
    {
        $mediaItems = Media::with('release.releaseGroup')->get();
        return $this->success($mediaItems);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $data = $request->validate([
            'release_id'  => 'required|integer|exists:releases,id',
            'format'      => 'required|in:CD,vinyl,cassette,digital',
            'position'    => 'nullable|integer',
            'name'        => 'nullable|string',
            'track_count' => 'nullable|integer',
        ]);

        $media = Media::create($data);
        return $this->success($media, 'Media created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $media = Media::with('release')->findOrFail($id);
        return $this->success($media);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $media = Media::findOrFail($id);
        $data = $request->validate([
            'release_id'  => 'required|integer|exists:releases,id',
            'format'      => 'required|in:CD,vinyl,cassette,digital',
            'position'    => 'nullable|integer',
            'name'        => 'nullable|string',
            'track_count' => 'nullable|integer',
        ]);

        $media->update($data);
        return $this->success($media, 'Media updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $media = Media::findOrFail($id);
        $media->delete();
        return $this->success(null, 'Media deleted');
    }
}
