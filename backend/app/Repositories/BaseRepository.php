<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository
{
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function find(int $id): ?Model
    {
        return $this->model->find($id);
    }

    public function all()
    {
        return $this->model->all();
    }

    public function paginate(int $perPage = 15)
    {
        return $this->model->paginate($perPage);
    }

    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $entity = $this->find($id);
        if (! $entity) {
            return false;
        }
        return $entity->update($data);
    }

    public function delete(int $id): bool
    {
        $entity = $this->find($id);
        if (! $entity) {
            return false;
        }
        return $entity->delete();
    }
}
