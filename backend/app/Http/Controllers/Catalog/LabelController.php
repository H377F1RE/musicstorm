<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\ApiController;
use App\Models\Label;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LabelController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $q = $request->query('search', '');
        $query = Label::query();
        if ($q !== '') {
            $query->where('name', 'like', "%{$q}%");
        }
        $labels = $query->get();
        return $this->success($labels);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $data = $request->validate([
            'name'    => 'required|string|max:128|unique:labels,name',
            'country' => 'nullable|string|size:2',
        ]);

        $label = Label::create($data);
        return $this->success($label, 'Label created', 201);
    }

    public function show(int $id): JsonResponse
    {
        $label = Label::with(['releases'])->findOrFail($id);
        return $this->success($label);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $label = Label::findOrFail($id);
        $data = $request->validate([
            'name'    => 'required|string|max:128|unique:labels,name,' . $label->id,
            'country' => 'nullable|string|size:2',
        ]);

        $label->update($data);
        return $this->success($label, 'Label updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return $this->error('Forbidden', 403);
        }

        $label = Label::findOrFail($id);
        $label->delete();
        return $this->success(null, 'Label deleted');
    }
}