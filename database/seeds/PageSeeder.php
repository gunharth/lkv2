<?php

use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        /*
         * Pages
         */
        // index
        DB::table('pages')->insert([
            'template_id' => 1,
        ]);
        // page 1
         DB::table('pages')->insert([
            'template_id' => 2,
        ]);

        /*
         * Page Translations
         */
        // index
        DB::table('page_translations')->insert([
            'page_id' => 1,
            'locale' => 'en',
            'slug' => 'home',
            'title' => 'Home',
            'content01' => 'Homepage in English',
        ]);
        DB::table('page_translations')->insert([
            'page_id' => 1,
            'locale' => 'de',
            'slug' => 'start',
            'title' => 'Start',
            'content01' => 'Startseite in Deutsch',
        ]);

        // page 1
        DB::table('page_translations')->insert([
            'page_id' => 2,
            'locale' => 'en',
            'slug' => 'page-1',
            'title' => 'Page 1',
            'content01' => 'Page 1',
        ]);
        DB::table('page_translations')->insert([
            'page_id' => 2,
            'locale' => 'de',
            'slug' => 'seite-1',
            'title' => 'Seite 1',
            'content01' => 'Seite 1 in Deutsch',
        ]);
    }
}
