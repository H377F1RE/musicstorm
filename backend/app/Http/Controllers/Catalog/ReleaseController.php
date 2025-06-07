<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\ApiController;
use App\Models\Release;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReleaseController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $q = $request->query('search', '');
        $query = Release::with(['releaseGroup.artist']);
        if ($q !== '') {
            $query->where('title', 'like', "%{$q}%");
        }
        $releases = $query->get();
        return $this->success($releases);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $data = $request->validate([
            'release_group_id' => 'required|integer|exists:release_groups,id',
            'label_id'         => 'nullable|integer|exists:labels,id',
            'title'            => 'required|string|max:128',
            'cover'            => 'nullable|string',
            'release_date'     => 'nullable|date',
            'country'          => 'nullable|string|size:2',
            'catalog_number'   => 'nullable|string|max:64',
            'barcode'          => 'nullable|string|max:32',
        ]);

        $release = Release::create($data);
        return $this->success($release, 'Release created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $release = Release::with(['releaseGroup.artist','label','media.tracks'])->findOrFail($id);
        return $this->success($release);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $release = Release::findOrFail($id);
        $data = $request->validate([
            'release_group_id' => 'required|integer|exists:release_groups,id',
            'label_id'         => 'nullable|integer|exists:labels,id',
            'title'            => 'required|string|max:128',
            'cover'            => 'nullable|string',
            'release_date'     => 'nullable|date',
            'country'          => 'nullable|string|size:2',
            'catalog_number'   => 'nullable|string|max:64',
            'barcode'          => 'nullable|string|max:32',
        ]);

        $release->update($data);
        return $this->success($release, 'Release updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $release = Release::findOrFail($id);
        $release->delete();
        return $this->success(null, 'Release deleted');
    }
}
