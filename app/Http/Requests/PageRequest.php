<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;

class PageRequest extends Request
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Request all() override function to pass in slug for validation
     *
     * @return array
     */
    public function all()
    {
        $input = parent::all();
        if (empty($input['slug'])) {
            $input['slug'] = str_slug($input['title']);
        } else {
            $input['slug'] = str_slug($input['slug']);
        }
        return $input;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $global = [
            'title' => 'required|max:30',
        ];
        switch ($this->method()) {
            case 'GET':
            case 'DELETE':
            {
                return [];
            }
            case 'POST':
            {
                $custom = [
                    'slug'  => 'unique:page_translations,slug,NULL,page_id,locale,'.config('app.locale')
                ];
                return array_merge($global, $custom);
            }
            case 'PUT':
            case 'PATCH':
            {
                $custom = [];
                // if (substr_compare($this->path(), "content", -1, 7)) {
                //     return [];
                // }
                return array_merge($global, $custom);
            }
            default:break;
        }
    }
}
