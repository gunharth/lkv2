
{!! Form::model($menu,[
        'method' => 'PATCH',
        'route' => ['menu.update', $menu->id],
        'id' => 'updateMenu'
    ]) !!}

        
        <div class="form-group">
	    {!! Form::label('name','Menu Title') !!}
	    {!! Form::text('name',null,['class' => 'form-control', 'placeholder' => 'Menu Title']) !!}
	    </div>
	    <div class="form-group">
	    {!! Form::label('slug','Slug') !!}
	    {!! Form::text('slug',null,['class' => 'form-control', 'placeholder' => 'slug']) !!}
	    </div>
	    <div class="form-group">
	    {!! Form::label('morpher_type','Link') !!}
	     {!! Form::select(
                'morpher_type',
                Config::get('jodel.contentTypes'),
                $menu->morpher_type_simple,
                ['class' => 'form-control', 'id' => 'menuTypeSelector']
                ) !!}
	    </div>
	    <div class="form-group">
            {!! Form::select(
                'morpher_id',
                [],
                '',
                ['class' => 'form-control', 'id' => 'menuTypeItemSelector']
                ) !!}
        </div>
	    <div id="morpher_id_orig" style="display: none;">{{ $menu->morpher_id }}</div>

  {!! Form::close() !!}