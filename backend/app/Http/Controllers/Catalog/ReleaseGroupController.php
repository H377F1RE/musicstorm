<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\ApiController;
use App\Models\ReleaseGroup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReleaseGroupController extends ApiController
{
    public function index(): JsonResponse
    {
        $groups = ReleaseGroup::with('artist')->get();
        return $this->success($groups);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $data = $request->validate([
            'artist_id'          => 'required|integer|exists:artists,id',
            'name'               => 'required|string|max:128',
            'type'               => 'required|in:album,single,ep,compilation',
            'first_release_date' => 'nullable|date',
        ]);

        $group = ReleaseGroup::create($data);
        return $this->success($group, 'Release Group created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $group = ReleaseGroup::with('artist', 'releases')->findOrFail($id);
        return $this->success($group);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $group = ReleaseGroup::findOrFail($id);
        $data = $request->validate([
            'artist_id'          => 'required|integer|exists:artists,id',
            'name'               => 'required|string|max:128',
            'type'               => 'required|in:album,single,ep,compilation',
            'first_release_date' => 'nullable|date',
        ]);

        $group->update($data);
        return $this->success($group, 'Release Group updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $group = ReleaseGroup::findOrFail($id);
        $group->delete();
        return $this->success(null, 'Release Group deleted');
    }
}
