<?php
namespace Core;
use Twig\Loader\FilesystemLoader;
use Twig\Environment;
use Pug\Pug;
/**
DOC
===
actions read & archive (edit is Form)

TODO
=====
convert folder from template folder to reusable main, php style to twig
*/
trait Template {

protected $postType;
protected $templateData;
protected $twig;
protected $pug;

    protected function listTemplates() {
       return read_folder(GSROOT."template");
    }
 // Render all posts with the specified template
      //ADD  $this->formPagination(int $totalRes,int $cur=1) IN THE QUERY BELOW TO AUTOMATE method without LIMIT saved in the query
    protected function buildTemplateArchive(array $fetch): ?string {

        $cur = $_GET['pagenum'] ?? 1; // Get current page from GET parameters (default to 1 if not provided)
        // Calculate the starting row for the current page
        $offset = ($cur - 1) * $this->resultsPerPage;
       // Fetch posts with pagination using formPagination
        $limit =" LIMIT $offset, $this->resultsPerPage ";
        $query=json_decode($fetch['query_archive'],true);

        $params=[];
        if(!empty($query['params'])){
        foreach($query['params'] as $param){
        $params[]=$this->G[$param];
        }}
            $totalRes = $this->db->fa($query['query'],$params);

        $paginatedQuery =$query['query'].$limit;
        // Fetch posts and templates from database
        $posts = $this->db->fa($paginatedQuery,$params);


        // Load templates from JSON file
       // $this->templateData = jsonget($templateFile);
     //  xecho($templateHTML['template']);


       // Compile each post with the chosen template
        $output = "";

        foreach ($posts as $post) {
    // Load templates from provided HTML or database
            $this->postType= $post['type'] ?? "pug";
            $templateSource = $fetch['template_archive'];
            //add template.pug method

            $post['page']=$this->page;

            $this->templateData= json_decode($templateSource, true)
                ? json_decode($templateSource, true)[$this->postType]
                : ($templateSource ? $templateSource : CUBO_ROOT.$post['page'].'/template.pug');

             $output .= $this->renderTemplatePug($this->templateData,$post);
        }
        $output .= $this->formPagination(count($totalRes), $cur);
        return $output;
    }

protected function buildTemplateRead(array $fetch): ?string {

    $templateSource = $fetch['template_read'];

    $query = json_decode($fetch['query_read'],true);
    $this->templateData = json_decode($templateSource, true) ? json_decode($templateSource, true)[$this->postType] : $templateSource;

    $params=[];
    if(!empty($query['params'])){
    foreach($query['params'] as $param){
    $params[]=$this->G[$param];
    }}
//xecho($params);
//xecho($this->templateData);
    $post = $this->db->f($query['query'],$params);
            $post['page']=$this->page;
    // Compile each post with the chosen template
      $output = "";
    // Load templates from provided HTML or database
      $output .= $this->renderTemplatePug($this->templateData,$post);
        return $output;
    }
//Twig Render
protected function renderTemplateTwig(array $post, ?string $template): string {
    if (!$template) {
        return "<div>Template not found for post type.</div>";
    }
    try {
        // Initialize Twig with the template provided
        $loader = new \Twig\Loader\ArrayLoader(['index' => $template]);
        $twig = new \Twig\Environment($loader, [
            'autoescape' => 'html', // Ensure HTML escaping for security
        ]);
        // Render the template with post data
        return $twig->render('index', $post);
    } catch (\Twig\Error\LoaderError $e) {
        return "<div>Error loading template: {$e->getMessage()}</div>";
    } catch (\Twig\Error\RuntimeError $e) {
        return "<div>Runtime error in template: {$e->getMessage()}</div>";
    } catch (\Twig\Error\SyntaxError $e) {
        return "<div>Syntax error in template: {$e->getMessage()}</div>";
    }
}
//Pug Render
protected function renderTemplatePug(string $template,array $post=[]): string {
    if (!$template) {
        return "<div>Template not found for post type.</div>";
    }
    $pug = new Pug([
     ' pretty ' => true
    ]);
    // Render a Pug template as a string
     return $pug->render($template, $post);
}

    // Function to compile a template with data
    protected function renderTemplate($data) {
        if (!isset($this->templateData[$this->postType])){
            return "<p>Template {$this->postType} not found.</p>";
        }
        // Get the template HTML string
        $htmlTemplate = $this->templateData[$this->postType];

       // $columns =$this->db->columns("post",true);
        // Replace placeholders with data
        foreach ($data as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $htmlTemplate = str_replace($placeholder, $value, $htmlTemplate);
        }
        return $htmlTemplate;
    }

protected function renderTemplate2($data) {
    if (!isset($this->templateData[$this->postType])) {
        return "<p>Template {$this->postType} not found.</p>";
    }

    $htmlTemplate = $this->templateData[$this->postType];

    // Handle `#each` logic
    $htmlTemplate = preg_replace_callback('/{{#each (\w+)}}(.*?){{\/each}}/s', function ($matches) use ($data) {
        $key = $matches[1];
        $template = $matches[2];
        if (!isset($data[$key]) || !is_array($data[$key])) {
            error_log("Key {$key} is missing or not an array.");
            return '';
        }
        $output = '';
        foreach ($data[$key] as $item) {
            $temp = $template;
            foreach ($item as $itemKey => $itemValue) {
                $temp = str_replace('{{' . $itemKey . '}}', htmlspecialchars($itemValue), $temp);
            }
            $output .= $temp;
        }
        return $output;
    }, $htmlTemplate);

    // Handle `#if` logic
    $htmlTemplate = preg_replace_callback('/{{#if (\w+)}}(.*?)({{else}}(.*?))?{{\/if}}/s', function ($matches) use ($data) {
        $key = $matches[1]; // The condition key
        $trueBlock = $matches[2]; // Content for true condition
        $falseBlock = isset($matches[4]) ? $matches[4] : ''; // Content for false condition (optional)

        // Check if the key is set and non-empty
        return !empty($data[$key]) ? $trueBlock : $falseBlock;
    }, $htmlTemplate);

    // Simple replacements for remaining placeholders
    foreach ($data as $key => $value) {
        $placeholder = '{{' . $key . '}}';
        $htmlTemplate = str_replace($placeholder, htmlspecialchars($value), $htmlTemplate);
    }

    return $htmlTemplate;
}


	public function templateSimilar($new,$old){
		$filesnew=rglob("$new/*");
		$filesold=rglob("$old/*");
		$array=array();
		$templatenew=basename($new);
		$basenew= explode('templates/',$new)[0].'templates/';
		$baseold= explode('templates/',$old)[0].'templates/';
		foreach($filesnew as $filen){
			$newfilenames[]=explode('/templates/',$filen)[1];
		}
		foreach($filesold as $fileo){
			$oldfilenames[]=explode('/templates/',$fileo)[1];
		}
		//1 find files added new local installed template than in store
		$diff=array_diff($newfilenames,$oldfilenames); //new files

		//2 compare hash files it's ok with hash but we need to compare all folders
			$common=array_intersect($newfilenames,$oldfilenames);
			//break common to two arrays with hashes and then compare them
			foreach($common as $comfile){
			if(hash_file('md5', $basenew.$comfile)!=hash_file('md5', $baseold.$comfile)){
				$count_changed +=1;
			}
			}
			$sim['new_files_rate']=number_format((count($diff)/(count($newfilenames)+count($oldfilenames)))*100, 2, '.', '');
			$sim['changed_files_rate']=number_format(($count_changed/count($common))*100, 2, '.', '');
		return $sim;
	}
}
?>
