<?php

namespace App;

use Cviebrock\EloquentSluggable\SluggableInterface;
use Cviebrock\EloquentSluggable\SluggableTrait;
use Baum\Node;

/**
* Menue
*/
class Menu extends Node implements SluggableInterface
{

    use SluggableTrait;
    //use HasTranslations;
    use \Dimsav\Translatable\Translatable;

    protected $sluggable = [
        'build_from' => 'name',
        'save_to'    => 'slug',
        'on_update'  => false
    ];


    /**
   * Table name.
   *
   * @var string
   */
  protected $table = 'menus';

    protected $fillable = [
      'name',
      'menu_type_id',
      'slug',
      'morpher_id',
      'morpher_type',
      'external_link'
    ];

    public $translatedAttributes = [
        'slug',
        'name',
    ];

    // public function getRouteKeyName()
    // {
    //     return 'slug';
    // }

  /*public function page()
  {
      return $this->belongsTo('App\Page');
  }*/

  protected $appends = [
        'morpher_type_simple'
    ];

    public function morpher()
    {
        return $this->morphTo();
    }

    protected $scoped = array('menu_type_id');

    public function setMorpherType()
    {
        return $this->morphTo();
    }
    
    public function setMorpherTypeAttribute($value)
    {
        $this->attributes['morpher_type'] = 'App\\'.$value;
    }

    public function getMorpherTypeSimpleAttribute()
    {
        return str_replace("App\\", "", $this->morpher_type);
    }

/*    public function getSlugAttribute()
    {
        return $this->getTranslation('slug', 'en');
    }*/

  //////////////////////////////////////////////////////////////////////////////

  //
  // Below come the default values for Baum's own Nested Set implementation
  // column names.
  //
  // You may uncomment and modify the following fields at your own will, provided
  // they match *exactly* those provided in the migration.
  //
  // If you don't plan on modifying any of these you can safely remove them.
  //

  // /**
  //  * Column name which stores reference to parent's node.
  //  *
  //  * @var string
  //  */
  // protected $parentColumn = 'parent_id';

  // /**
  //  * Column name for the left index.
  //  *
  //  * @var string
  //  */
  // protected $leftColumn = 'lft';

  // /**
  //  * Column name for the right index.
  //  *
  //  * @var string
  //  */
  // protected $rightColumn = 'rgt';

  // /**
  //  * Column name for the depth field.
  //  *
  //  * @var string
  //  */
  // protected $depthColumn = 'depth';

  // /**
  //  * Column to perform the default sorting
  //  *
  //  * @var string
  //  */
  // protected $orderColumn = null;

  // /**
  // * With Baum, all NestedSet-related fields are guarded from mass-assignment
  // * by default.
  // *
  // * @var array
  // */
  // protected $guarded = array('id', 'parent_id', 'lft', 'rgt', 'depth');

  //
  // This is to support "scoping" which may allow to have multiple nested
  // set trees in the same database table.
  //
  // You should provide here the column names which should restrict Nested
  // Set queries. f.ex: company_id, etc.
  //

  // /**
  //  * Columns which restrict what we consider our Nested Set list
  //  *
  //  * @var array
  //  */
  // protected $scoped = array();

  //////////////////////////////////////////////////////////////////////////////

  //
  // Baum makes available two model events to application developers:
  //
  // 1. `moving`: fired *before* the a node movement operation is performed.
  //
  // 2. `moved`: fired *after* a node movement operation has been performed.
  //
  // In the same way as Eloquent's model events, returning false from the
  // `moving` event handler will halt the operation.
  //
  // Please refer the Laravel documentation for further instructions on how
  // to hook your own callbacks/observers into this events:
  // http://laravel.com/docs/5.0/eloquent#model-events
}
